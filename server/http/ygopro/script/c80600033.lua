--黄血鬼
function c80600033.initial_effect(c)
  --spsummon
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80600033,0))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e1:SetRange(LOCATION_HAND)
	e1:SetCode(EVENT_SPSUMMON_SUCCESS)
	e1:SetCondition(c80600033.spcon)
	e1:SetTarget(c80600033.sptg)
	e1:SetOperation(c80600033.spop)
	c:RegisterEffect(e1)
	--reduce ATK
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80600033,1))
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCountLimit(1)
	e2:SetCost(c80600033.cost)
	e2:SetTarget(c80600033.target)
	e2:SetOperation(c80600033.operation)
	c:RegisterEffect(e2)
end

function c80600033.spcon(e,tp,eg,ep,ev,re,r,rp)
	return eg:GetCount()==1 and eg:GetFirst():GetSummonType()==SUMMON_TYPE_XYZ and eg:GetFirst():IsControler(tp)
end
function c80600033.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
end
function c80600033.spop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) then
		Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEUP)
	end
end
function c80600033.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetOverlayCount(tp,1,0)>0 end
	Duel.RemoveOverlayCard(tp,1,0,1,1,REASON_COST)
end
function c80600033.filter(c)
	return c:IsFaceup() and c:IsType(TYPE_XYZ) and c:IsRankAbove(0)
end
function c80600033.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(1-tp) and chkc:IsLocation(LOCATION_MZONE) and c80600033.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c80600033.filter,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	Duel.SelectTarget(tp,c80600033.filter,tp,0,LOCATION_MZONE,1,1,nil)
end
function c80600033.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsFaceup() and tc:IsRelateToEffect(e) then
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_UPDATE_XYZ_LEVEL)
		e1:SetValue(-1)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		tc:RegisterEffect(e1)
		local e2=Effect.CreateEffect(c)
		e2:SetType(EFFECT_TYPE_SINGLE)
		e2:SetCode(EFFECT_UPDATE_ATTACK)
		e2:SetValue(-300)
		e2:SetReset(RESET_EVENT+0x1fe0000)
		tc:RegisterEffect(e2)
	end
end
