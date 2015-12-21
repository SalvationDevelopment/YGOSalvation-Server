--Gaia the Soaring Dragon Champion
function c13701814.initial_effect(c)
	--fusion material
	c:EnableReviveLimit()
	aux.AddFusionProcFun2(c,aux.FilterBoolFunction(Card.IsSetCard,0xbd),aux.FilterBoolFunction(Card.IsRace,RACE_DRAGON),true)
	--code
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_CHANGE_CODE)
	e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetValue(66889139)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(76459806,0))
	e2:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e2:SetType(EFFECT_TYPE_TRIGGER_O+EFFECT_TYPE_SINGLE)
	e2:SetCode(EVENT_SPSUMMON_SUCCESS)
	e2:SetTarget(c13701814.tg)
	e2:SetOperation(c13701814.op)
	c:RegisterEffect(e2)
	--poschange
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(84243274,1))
	e3:SetCategory(CATEGORY_POSITION)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetCode(EVENT_ATTACK_ANNOUNCE)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e3:SetTarget(c13701814.postg)
	e3:SetOperation(c13701814.posop)
	c:RegisterEffect(e3)
end
function c13701814.filter(c)
	return c:IsCode(49328340) and c:IsAbleToHand() and not c:IsHasEffect(EFFECT_NECRO_VALLEY)
end
function c13701814.tg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13701814.filter,tp,LOCATION_DECK+LOCATION_GRAVE,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK+LOCATION_GRAVE)
end
function c13701814.op(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c13701814.filter,tp,LOCATION_DECK+LOCATION_GRAVE,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end
function c13701814.postg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return false end
	local bc=Duel.GetAttackTarget()
	if chk==0 then return bc and bc:IsCanBeEffectTarget(e) end
	Duel.SetTargetCard(bc)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,bc,1,0,0)
end
function c13701814.posop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.ChangePosition(tc,POS_FACEUP_DEFENCE,POS_FACEDOWN_DEFENCE,POS_FACEUP_ATTACK,POS_FACEUP_ATTACK,true)
	end
end
