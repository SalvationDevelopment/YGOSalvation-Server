--Juragedo (i cause Konami change this card errata. SORRY)
function c13790584.initial_effect(c)
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(TIMING_BATTLE_PHASE)
	e1:SetRange(LOCATION_HAND)
	e1:SetCountLimit(1,13790584)
	e1:SetCondition(c13790584.condition)
	e1:SetTarget(c13790584.target1)
	e1:SetOperation(c13790584.operation1)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_ATKCHANGE+CATEGORY_DEFCHANGE)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCost(c13790584.cost)
	e2:SetTarget(c13790584.target)
	e2:SetOperation(c13790584.operation)
	c:RegisterEffect(e2)
end
function c13790584.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetAttacker()~=nil and not e:GetHandler():IsStatus(STATUS_CHAINING) 
end
function c13790584.target1(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then
		return Duel.GetLocationCount(tp,LOCATION_MZONE)>0 and not e:GetHandler():IsStatus(STATUS_CHAINING) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
	end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,c,1,0,0)
end
function c13790584.operation1(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) and Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEUP)>0 then
		Duel.BreakEffect()
		Duel.Recover(tp,1000,REASON_EFFECT)
	end
end

function c13790584.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsReleasable() end
	Duel.Release(e:GetHandler(),REASON_COST)
end
function c13790584.filter(c)
	return c:IsFaceup()
end
function c13790584.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and c13790584.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c13790584.filter,tp,LOCATION_MZONE,0,1,e:GetHandler()) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	Duel.SelectTarget(tp,c13790584.filter,tp,LOCATION_MZONE,0,1,1,nil)
end
function c13790584.operation(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and c13790584.filter(tc) then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_UPDATE_ATTACK)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_STANDBY+RESET_SELF_TURN)
		e1:SetValue(1000)
		tc:RegisterEffect(e1)
	end
end
