--念導力
function c1208.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY+CATEGORY_RECOVER)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_BATTLE_DESTROYED)
	e1:SetCondition(c1208.condition)
	e1:SetTarget(c1208.target)
	e1:SetOperation(c1208.activate)
	c:RegisterEffect(e1)
end
function c1208.filter(c,tp)
	return c:GetPreviousControler()==tp and c:IsPreviousPosition(POS_FACEUP)
		and c==Duel.GetAttackTarget()
end
function c1208.condition(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c1208.filter,1,nil,tp)
end
function c1208.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	local at=Duel.GetAttacker()
	if chkc then return chkc==at end
	if chk==0 then return at:IsControler(1-tp) and at:IsRelateToBattle() and at:IsCanBeEffectTarget(e) and at:IsDestructable() end
	Duel.SetTargetCard(at)
	local atk=at:GetAttack()
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,at,1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_RECOVER,nil,0,tp,atk)
end
function c1208.activate(e,tp,eg,ep,ev,re,r,rp)
	local a=Duel.GetFirstTarget()
	if a:IsRelateToEffect(e) then
		local atk=a:GetAttack()
		if Duel.Destroy(a,REASON_EFFECT)~=0 then
			Duel.Recover(tp,atk,REASON_EFFECT)
		end
	end
end
