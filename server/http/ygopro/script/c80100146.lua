--クリアウィング・シンクロ・ドラゴン
function c80100146.initial_effect(c)
	--synchro summon
	aux.AddSynchroProcedure(c,nil,aux.NonTuner(nil),1)
	c:EnableReviveLimit()
	--negate
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80100146,0))
	e1:SetCategory(CATEGORY_NEGATE)
	e1:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DAMAGE_CAL)
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetCode(EVENT_CHAINING)
	e1:SetCondition(c80100146.condition)
	e1:SetTarget(c80100146.target)
	e1:SetOperation(c80100146.operation)
	c:RegisterEffect(e1)
	--
	local e2=e1:Clone()
	e2:SetDescription(aux.Stringid(80100146,1))
	e2:SetCondition(c80100146.condition1)
	c:RegisterEffect(e2)
	--atkup
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80100146,2))
	e1:SetCategory(CATEGORY_ATKCHANGE)
	e3:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCode(EVENT_DESTROYED)
	e3:SetCondition(c80100146.atkcondition)
	e3:SetOperation(c80100146.atkoperation)
	c:RegisterEffect(e3)
end
function c80100146.condition(e,tp,eg,ep,ev,re,r,rp,chk)
	local loc=Duel.GetChainInfo(ev,CHAININFO_TRIGGERING_LOCATION)
	return loc==LOCATION_MZONE and re:IsActiveType(TYPE_MONSTER) and Duel.IsChainNegatable(ev)
		and re:GetHandler():IsLevelAbove(5)
		and re:GetHandler()~=e:GetHandler()
end
function c80100146.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_NEGATE,eg,1,0,0)
	if re:GetHandler():IsDestructable() and re:GetHandler():IsRelateToEffect(re) then
		Duel.SetOperationInfo(0,CATEGORY_DESTROY,eg,1,0,0)
	end
end
function c80100146.operation(e,tp,eg,ep,ev,re,r,rp)
	local tc=re:GetHandler()
	Duel.NegateActivation(ev)
	if tc:IsRelateToEffect(re) then
		Duel.Destroy(eg,REASON_EFFECT)
	end
end
function c80100146.tfilter(c,tp)
	return c:IsLocation(LOCATION_MZONE) and c:IsFaceup() and c:IsLevelAbove(5) 
end
function c80100146.condition1(e,tp,eg,ep,ev,re,r,rp,chk)
	if not re:IsHasProperty(EFFECT_FLAG_CARD_TARGET) then return false end
	local g=Duel.GetChainInfo(ev,CHAININFO_TARGET_CARDS)
	return g and g:GetCount()==1 and g:IsExists(c80100146.tfilter,1,nil,tp) and Duel.IsChainNegatable(ev)
			and re:IsActiveType(TYPE_MONSTER)
end
function c80100146.atkcondition(e,tp,eg,ep,ev,re,r,rp)
	local tc=eg:GetFirst()
	if not tc or not re then return end
	e:SetLabel(tc:GetBaseAttack())
	local rc=re:GetHandler() 
	return tc:IsReason(REASON_EFFECT) and rc==e:GetHandler()
end
function c80100146.atkoperation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) and c:IsFaceup() then
		local val=e:GetLabel()
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_UPDATE_ATTACK)
		e1:SetValue(val)
		e1:SetReset(RESET_EVENT+0x1ff0000+RESET_PHASE+PHASE_END)
		c:RegisterEffect(e1)
	end
end