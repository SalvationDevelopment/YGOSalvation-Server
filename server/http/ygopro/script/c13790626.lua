--Goyo King
function c13790626.initial_effect(c)
	--synchro summon
	aux.AddSynchroProcedure(c,nil,aux.NonTuner(Card.IsType,TYPE_SYNCHRO),1)
	c:EnableReviveLimit()
	--atk up
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(13790626,0))
	e1:SetCategory(CATEGORY_ATKCHANGE)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e1:SetCode(EVENT_ATTACK_ANNOUNCE)
	e1:SetCondition(c13790626.atkcon)
	e1:SetOperation(c13790626.atkop)
	c:RegisterEffect(e1)
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetCode(EVENT_BATTLE_DESTROYING)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetCondition(c13790626.spcon)
	e1:SetTarget(c13790626.sptg)
	e1:SetOperation(c13790626.spop)
	c:RegisterEffect(e1)
end
function c13790626.atkcon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetAttackTarget()~=nil
end
function c13790626.atkop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_UPDATE_ATTACK)
	e1:SetValue(c13790626.atkval)
	e1:SetReset(RESET_PHASE+PHASE_DAMAGE)
	c:RegisterEffect(e1)
end
function c13790626.filter(c)
	return c:IsFaceup() and c:IsRace(RACE_WARRIOR) and c:IsAttribute(ATTRIBUTE_EARTH) and c:IsType(TYPE_SYNCHRO)
end
function c13790626.atkval(e,c)
	return Duel.GetMatchingGroupCount(c13790626.filter,c:GetControler(),LOCATION_MZONE,0,nil)*400
end

function c13790626.cfilter(c)
	return c:IsFaceup() and c:IsControlerCanBeChanged()
end
function c13790626.spcon(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local bc=c:GetBattleTarget()
	if not c:IsRelateToBattle() or c:IsFacedown() then return false end
	return bc:IsLocation(LOCATION_GRAVE) and bc:IsType(TYPE_MONSTER)
end
function c13790626.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	local bc=e:GetHandler():GetBattleTarget()
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and (bc:IsCanBeSpecialSummoned(e,0,tp,false,false) or Duel.IsExistingTarget(c13790626.cfilter,tp,0,LOCATION_MZONE,1,nil)) end
	local op=0
	if bc:IsCanBeSpecialSummoned(e,0,tp,false,false) then op=op+1 end
	if Duel.IsExistingTarget(c13790626.cfilter,tp,0,LOCATION_MZONE,1,nil) then op=op+2 end
	if op==3 then
		Duel.Hint(HINT_SELECTMSG,tp,aux.Stringid(13790626,0))
		op=Duel.SelectOption(tp,aux.Stringid(13790626,1),aux.Stringid(13790626,2))+1
	end
	if op==1 then
		Duel.SetTargetCard(bc)
	elseif op==2 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_CONTROL)
	local g=Duel.SelectTarget(tp,c13790626.cfilter,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_CONTROL,g,1,0,0)
	end
	e:SetLabel(op)
end
function c13790626.spop(e,tp,eg,ep,ev,re,r,rp)
	local op=e:GetLabel()
	if op==0 then return end
	local tc=Duel.GetFirstTarget()
	if op==1 then
		if tc:IsRelateToEffect(e) then
			Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)
		end
	end
	if op==2 then
		if tc:IsRelateToEffect(e) and not Duel.GetControl(tc,tp) then
			if not tc:IsImmuneToEffect(e) and tc:IsAbleToChangeControler() then
				Duel.Destroy(tc,REASON_EFFECT)
			end
		end
	end
end
