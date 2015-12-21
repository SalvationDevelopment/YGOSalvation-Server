--Scales of Judgment
function c7443336.initial_effect(c)
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCountLimit(1,7443336)
	e1:SetCondition(c7443336.descon)
	e1:SetTarget(c7443336.target)
	e1:SetOperation(c7443336.activate)
	c:RegisterEffect(e1)

end
function c7443336.descon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()==tp
		and Duel.GetFieldGroupCount(tp,LOCATION_ONFIELD+LOCATION_HAND,0)<Duel.GetFieldGroupCount(tp,0,LOCATION_ONFIELD)
end
function c7443336.target(e,tp,eg,ep,ev,re,r,rp,chk)
	local draw=Duel.GetFieldGroupCount(tp,0,LOCATION_ONFIELD)-Duel.GetFieldGroupCount(tp,LOCATION_ONFIELD+LOCATION_HAND,0)
	if chk==0 then return Duel.IsPlayerCanDraw(tp,draw) end
	Duel.SetTargetPlayer(tp)
	Duel.SetTargetParam(draw)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,draw)
end
function c7443336.activate(e,tp,eg,ep,ev,re,r,rp)
	local p,d=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
	Duel.Draw(p,d,REASON_EFFECT)
end

