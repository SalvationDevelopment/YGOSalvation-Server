--ゴーストリック・パニック
function c80600074.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c80600074.con)
	e1:SetTarget(c80600074.target)
	e1:SetOperation(c80600074.op)
	c:RegisterEffect(e1)
end
function c80600074.con(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingTarget(Card.IsFacedown,tp,LOCATION_MZONE,0,1,nil)
end
function c80600074.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chk==0 then return Duel.IsExistingTarget(Card.IsFacedown,tp,LOCATION_MZONE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	local fd=Duel.GetMatchingGroupCount(Card.IsFacedown,tp,LOCATION_MZONE,0,nil)
	local g=Duel.SelectTarget(tp,Card.IsFacedown,tp,LOCATION_MZONE,0,1,fd,nil)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,g,1,0,0)
end
function c80600074.op(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local fd= g:Filter(Card.IsSetCard,nil,0x91):GetCount()
	if g:GetCount()>0 then
		if Duel.ChangePosition(g,POS_FACEUP_DEFENCE) then
			if fd>0 then
				local flip=Duel.SelectTarget(tp,Card.IsFaceup,tp,0,LOCATION_MZONE,1,fd,nil)
				Duel.ChangePosition(flip,POS_FACEDOWN_DEFENCE)
			end
		end
	end
end