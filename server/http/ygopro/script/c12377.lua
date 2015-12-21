--Service Ace
function c12377.initial_effect(c)
	--damage
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCategory(CATEGORY_DAMAGE)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetTarget(c12377.damtg)
	e1:SetOperation(c12377.damop)
	c:RegisterEffect(e1)
end
function c12377.damtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetTargetPlayer(1-tp)
	Duel.SetTargetParam(1500)
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,1-tp,1500)
end

function c12377.damop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetFieldGroup(tp,LOCATION_HAND,0):Select(tp,1,1,nil)
	local tc=g:GetFirst()
	if tc then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_CARDTYPE)
		local op=Duel.SelectOption(1-tp,70,71,72)
		Duel.ConfirmCards(1-tp,tc)
		Duel.ShuffleHand(tp)
		if tc:IsAbleToRemove() and (op~=0 and tc:IsType(TYPE_MONSTER)) or (op~=1 and tc:IsType(TYPE_SPELL)) or (op~=2 and tc:IsType(TYPE_TRAP)) then
			p,d=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
		Duel.Damage(p,d,REASON_EFFECT)
		Duel.DisableShuffleCheck()
		Duel.Remove(g,POS_FACEUP,REASON_EFFECT)
		else
		Duel.DisableShuffleCheck()
		Duel.Remove(g,POS_FACEUP,REASON_EFFECT)
		end
	end
end
