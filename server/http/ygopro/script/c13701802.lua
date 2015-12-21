--Number 93: Utopia Kaiser
function c13701802.initial_effect(c)
	--xyz summon
	c:EnableReviveLimit()
	local e1=Effect.CreateEffect(c)
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetRange(LOCATION_EXTRA)
	e1:SetCondition(c13701802.xyzcon)
	e1:SetOperation(c13701802.xyzop)
	e1:SetValue(SUMMON_TYPE_XYZ)
	c:RegisterEffect(e1)
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetDescription(aux.Stringid(69015963,0))
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetTarget(c13701802.target)
	e1:SetOperation(c13701802.operation)
	c:RegisterEffect(e1)
	--cannot be target
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE)
	e4:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e4:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCondition(c13701802.tgcon)
	e4:SetValue(aux.imval1)
	c:RegisterEffect(e4)
	local e5=e4:Clone()
	e5:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
	e5:SetValue(aux.tgval)
	c:RegisterEffect(e5)
end
c13701802.xyz_number=93
function c13701802.mfilter(c,xyzc)
	return c:IsFaceup() and c:IsType(TYPE_XYZ) and c:IsSetCard(0x48) and c:IsCanBeXyzMaterial(xyzc)
end
function c13701802.xyzfilter1(c,g)
	return g:IsExists(c13701802.xyzfilter2,1,c,c:GetRank()) and c:GetOverlayCount()~=0
end
function c13701802.xyzfilter2(c,rk)
	return c:GetRank()==rk and c:GetOverlayCount()~=0
end
function c13701802.xyzcon(e,c,og)
	if c==nil then return true end
	local tp=c:GetControler()
	local ft=Duel.GetLocationCount(tp,LOCATION_MZONE)
	local ct=-ft
	if 2<=ct then return false end
	local mg=Duel.GetMatchingGroup(c13701802.mfilter,tp,LOCATION_MZONE,0,nil,c)
	return mg:IsExists(c13701802.xyzfilter1,1,nil,mg)
end
function c13701802.xyzop(e,tp,eg,ep,ev,re,r,rp,c,og)
	local ft=Duel.GetLocationCount(tp,LOCATION_MZONE)
	local ct=-ft
	local mg=Duel.GetMatchingGroup(c13701802.mfilter,tp,LOCATION_MZONE,0,nil,c)
	local b1=mg:IsExists(c13701802.xyzfilter1,1,nil,mg)
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_XMATERIAL)
		local g1=mg:FilterSelect(tp,c13701802.xyzfilter1,1,1,nil,mg)
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_XMATERIAL)
		local g2=mg:FilterSelect(tp,c13701802.xyzfilter2,1,4,g1:GetFirst(),g1:GetFirst():GetRank())
		g1:Merge(g2)
		local sg=Group.CreateGroup()
		local tc=g1:GetFirst()
		while tc do
			sg:Merge(tc:GetOverlayGroup())
			tc=g1:GetNext()
		end
		Duel.SendtoGrave(sg,REASON_RULE)
		c:SetMaterial(g1)
		Duel.Overlay(c,g1)
end

function c13701802.spfilter(c,e,tp)
	return c:IsType(TYPE_XYZ) and c:IsSetCard(0x48) and c:GetRank()<10 and c:GetAttack()<=3000 and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c13701802.rfilter(c,rk)
	return c:IsType(TYPE_XYZ) and c:IsSetCard(0x48) and c:GetRank()==rk
end
function c13701802.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0 and e:GetHandler():GetOverlayCount()~=0
		and Duel.IsExistingMatchingCard(c13701802.spfilter,tp,LOCATION_EXTRA,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_EXTRA)
end

function c13701802.operation(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	local c=e:GetHandler()
	local og=c:GetOverlayGroup()
	local of=og:GetFirst()
	local ct=0
	while og:GetCount()>0 do
		og:Remove(Card.IsCode,nil,of:GetCode())
		of=og:GetNext()
		ct=ct+1
	end
	local g=Duel.GetMatchingGroup(c13701802.spfilter,tp,LOCATION_EXTRA,0,nil,e,tp)
	while ct>0 and g:GetCount()>0 and Duel.GetLocationCount(tp,LOCATION_MZONE)>0 do
		local sg1=g:Select(tp,1,1,nil)
		local tc=sg1:GetFirst()
		g:Remove(c13701802.rfilter,nil,tc:GetRank())
		ct=ct-1
		Duel.SpecialSummonStep(tc,0,tp,tp,false,false,POS_FACEUP)		
		local e2=Effect.CreateEffect(c)
		e2:SetType(EFFECT_TYPE_SINGLE)
		e2:SetCode(EFFECT_DISABLE)
		e2:SetReset(RESET_EVENT+0x1fe0000)
		tc:RegisterEffect(e2)
		local e3=Effect.CreateEffect(c)
		e3:SetType(EFFECT_TYPE_SINGLE)
		e3:SetCode(EFFECT_DISABLE_EFFECT)
		e3:SetReset(RESET_EVENT+0x1fe0000)
		tc:RegisterEffect(e3)
	tc=sg1:GetNext()
	if g:GetCount()>0 and ct>0 and not Duel.SelectYesNo(tp,aux.Stringid(68191243,0)) then ct=0 end
	end
	Duel.SpecialSummonComplete()
	c:RemoveOverlayCard(tp,1,1,REASON_EFFECT)
	--~ Halve Damage
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_CHANGE_DAMAGE)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetTargetRange(0,1)
	e1:SetValue(c13701802.val)
	e1:SetReset(RESET_PHASE+PHASE_END,1)
	Duel.RegisterEffect(e1,tp)
	--~ Cannot Special Summon
	local e2=Effect.CreateEffect(e:GetHandler())
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetTargetRange(1,0)
	e2:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e2,tp)
	
end
function c13701802.val(e,re,dam,r,rp,rc)
	if bit.band(r,REASON_BATTLE)~=0 then
		return dam/2
	else return dam end
end
function c13701802.tgfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x48)
end
function c13701802.tgcon(e)
	return Duel.IsExistingMatchingCard(c13701802.tgfilter,e:GetHandlerPlayer(),LOCATION_MZONE,0,1,e:GetHandler())
end

