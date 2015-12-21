--The Winged Dragon of Ra – Sphere Mode
function c13716001.initial_effect(c)
	local e1=Effect.CreateEffect(c)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_LIMIT_SUMMON_PROC)
	e1:SetCondition(c13716001.ttcon)
	e1:SetOperation(c13716001.ttop)
	e1:SetValue(SUMMON_TYPE_ADVANCE)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_LIMIT_SET_PROC)
	e2:SetCondition(c13716001.setcon)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_CANNOT_ATTACK)
	c:RegisterEffect(e3)
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE)
	e4:SetCode(EFFECT_CANNOT_BE_BATTLE_TARGET)
	e4:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e4:SetRange(LOCATION_MZONE)
	e4:SetValue(1)
	c:RegisterEffect(e4)
	local e5=Effect.CreateEffect(c)
	e5:SetType(EFFECT_TYPE_SINGLE)
	e5:SetCode(EFFECT_CANNOT_BE_EFFECT_TARGET)
	e5:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e5:SetRange(LOCATION_MZONE)
	e5:SetValue(c13716001.tgval)
	c:RegisterEffect(e5)
	--special summon
	local e6=Effect.CreateEffect(c)
	e6:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e6:SetType(EFFECT_TYPE_IGNITION)
	e6:SetRange(LOCATION_MZONE)
	e6:SetCost(c13716001.spcost)
	e6:SetTarget(c13716001.sptg)
	e6:SetOperation(c13716001.spop)
	c:RegisterEffect(e6)
	--cannot special summon
	local e7=Effect.CreateEffect(c)
	e7:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e7:SetType(EFFECT_TYPE_SINGLE)
	e7:SetCode(EFFECT_SPSUMMON_CONDITION)
	c:RegisterEffect(e7)
	local e8=Effect.CreateEffect(c)
	e8:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e8:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
	e8:SetCode(EVENT_SUMMON_SUCCESS)
	e8:SetOperation(c13716001.regop)
	c:RegisterEffect(e8)
end
function c13716001.ttcon(e,c,tp)
	if c==nil then return true end
	return Duel.CheckReleaseGroup(tp,nil,3,nil) or Duel.CheckReleaseGroup(1-tp,nil,3,nil)
end
function c13716001.ttop(e,tp,eg,ep,ev,re,r,rp,c)
	local controler=0
	if Duel.CheckReleaseGroup(tp,nil,3,nil) and Duel.CheckReleaseGroup(1-tp,nil,3,nil) and 
	Duel.SelectYesNo(tp,aux.Stringid(13716001,0)) then control=2 else control=1 end
		
	if not Duel.CheckReleaseGroup(tp,nil,3,nil) and Duel.CheckReleaseGroup(1-tp,nil,3,nil) or control==2 then
		local sg=Duel.SelectMatchingCard(tp,Card.IsReleasable,tp,0,LOCATION_MZONE,3,3,nil,e,tp,nil)
		c:SetMaterial(sg)
		if Duel.Release(sg,REASON_SUMMON+REASON_MATERIAL) then return false end
	end
	
	if Duel.CheckReleaseGroup(tp,nil,3,nil) and not Duel.CheckReleaseGroup(1-tp,nil,3,nil) or control==1 then
			local g=Duel.SelectTribute(tp,c,3,3)
			c:SetMaterial(g)
			Duel.Release(g,REASON_SUMMON+REASON_MATERIAL)
			Duel.RegisterFlagEffect(tp,51282878,RESET_PHASE+PHASE_END,0,1)
	end
end

function c13716001.setcon(e,c)
	if not c then return true end
	return false
end
function c13716001.tgval(e,re,rp)
	return rp~=e:GetOwnerPlayer()
end
function c13716001.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsReleasable() end
	Duel.Release(e:GetHandler(),REASON_COST)
end
function c13716001.filter(c,e,tp)
	return c:GetCode()==10000010 and c:IsCanBeSpecialSummoned(e,0,tp,true,true)
end
function c13716001.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>-1
		and Duel.IsExistingMatchingCard(c13716001.filter,tp,LOCATION_HAND+LOCATION_DECK,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_HAND+LOCATION_DECK)
end
function c13716001.spop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c13716001.filter,tp,LOCATION_HAND+LOCATION_DECK,0,1,1,nil,e,tp)
	local c=e:GetHandler()
	local tc=g:GetFirst()
	if not tc then return end
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_SET_ATTACK)
	e1:SetValue(4000)
	e1:SetReset(RESET_EVENT+0xfe0000)
	tc:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_SET_DEFENCE)
	e2:SetValue(4000)
	e2:SetReset(RESET_EVENT+0xfe0000)
	tc:RegisterEffect(e2)
	Duel.SpecialSummon(tc,0,tp,tp,true,true,POS_FACEUP)
end
function c13716001.regop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
		if e:GetHandler():GetLocation()==LOCATION_HAND then
		Duel.SpecialSummon(e:GetHandler(),0,tp,1-tp,true,false,POS_FACEUP_ATTACK) end
	if Duel.GetFlagEffect(tp,51282878)==0 then
	Duel.GetControl(c,1-tp)
	end
	e:GetHandler():RegisterFlagEffect(13716001,RESET_EVENT+0x1ec0000+RESET_PHASE+PHASE_END,0,1)
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e1:SetCode(EVENT_PHASE+PHASE_END)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetCondition(c13716001.controlcon)
	e1:SetOperation(c13716001.controlop2)
	c:RegisterEffect(e1)
end
function c13716001.controlcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetFlagEffect(13716001)==0 and not e:GetHandler():IsDisabled()
end
function c13716001.controlop2(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE)
	e4:SetCode(EFFECT_SET_CONTROL)
	e4:SetValue(c:GetOwner())
	c:RegisterEffect(e4)
end
function c13716001.ctval(e,c)
	return e:GetHandlerPlayer()
end
